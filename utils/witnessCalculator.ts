// Constants and helper functions
const toHexString = (bytes: Uint8Array): string => 
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export const witnessCalculatorCode = `
// Core arithmetic and conversion utilities
function normalize(n, prime) {
    let res = BigInt(n) % prime;
    if (res < 0) res += prime;
    return res;
}

function flatArray(a) {
    const res = [];
    fillArray(res, a);
    return res;

    function fillArray(res, a) {
        if (Array.isArray(a)) {
            for (let i=0; i<a.length; i++) {
                fillArray(res, a[i]);
            }
        } else {
            res.push(a);
        }
    }
}

function fnvHash(str) {
    const uint64_max = BigInt(2) ** BigInt(64);
    let hash = BigInt("0xCBF29CE484222325");
    for (var i = 0; i < str.length; i++) {
        hash ^= BigInt(str[i].charCodeAt());
        hash *= BigInt(0x100000001B3);
        hash %= uint64_max;
    }
    let shash = hash.toString(16);
    let n = 16 - shash.length;
    shash = '0'.repeat(n).concat(shash);
    return shash;
}

function toArray32(rem, size) {
    const res = [];
    const radix = BigInt(0x100000000);
    while (rem) {
        res.unshift(Number(rem % radix));
        rem = rem / radix;
    }
    if (size) {
        var i = size - res.length;
        while (i>0) {
            res.unshift(0);
            i--;
        }
    }
    return res;
}

function fromArray32(arr) {
    var res = BigInt(0);
    const radix = BigInt(0x100000000);
    for (let i = 0; i<arr.length; i++) {
        res = res*radix + BigInt(arr[i]);
    }
    return res;
}

// Main WitnessCalculator class
class WitnessCalculator {
    constructor(instance, sanityCheck) {
        this.instance = instance;
        this.version = this.instance.exports.getVersion();
        this.n32 = this.instance.exports.getFieldNumLen32();

        this.instance.exports.getRawPrime();
        const arr = new Uint32Array(this.n32);
        for (let i=0; i<this.n32; i++) {
            arr[this.n32-1-i] = this.instance.exports.readSharedRWMemory(i);
        }
        this.prime = fromArray32(arr);
        this.witnessSize = this.instance.exports.getWitnessSize();
        this.sanityCheck = sanityCheck;
    }

    async calculateWTNSBin(input, sanityCheck) {
        const buff32 = new Uint32Array(this.witnessSize * this.n32 + this.n32 + 11);
        const buff = new Uint8Array(buff32.buffer);
        
        await this._doCalculateWitness(input, sanityCheck);

        // Write header
        buff[0] = "w".charCodeAt(0);
        buff[1] = "t".charCodeAt(0);
        buff[2] = "n".charCodeAt(0);
        buff[3] = "s".charCodeAt(0);
        buff32[1] = 2; // version 2
        buff32[2] = 2; // number of sections
        buff32[3] = 1; // id section 1

        const n8 = this.n32 * 4;
        const idSection1length = 8 + n8;
        const idSection1lengthHex = idSection1length.toString(16);
        buff32[4] = parseInt(idSection1lengthHex.slice(0,8), 16);
        buff32[5] = parseInt(idSection1lengthHex.slice(8,16), 16);
        buff32[6] = n8;

        this.instance.exports.getRawPrime();

        let pos = 7;
        for (let j=0; j<this.n32; j++) {
            buff32[pos+j] = this.instance.exports.readSharedRWMemory(j);
        }
        pos += this.n32;

        buff32[pos] = this.witnessSize;
        pos++;

        buff32[pos] = 2;
        pos++;

        const idSection2length = n8 * this.witnessSize;
        const idSection2lengthHex = idSection2length.toString(16);
        buff32[pos] = parseInt(idSection2lengthHex.slice(0,8), 16);
        buff32[pos+1] = parseInt(idSection2lengthHex.slice(8,16), 16);

        pos += 2;
        for (let i=0; i<this.witnessSize; i++) {
            this.instance.exports.getWitness(i);
            for (let j=0; j<this.n32; j++) {
                buff32[pos+j] = this.instance.exports.readSharedRWMemory(j);
            }
            pos += this.n32;
        }

        return buff;
    }

    async _doCalculateWitness(input, sanityCheck) {
        this.instance.exports.init((this.sanityCheck || sanityCheck) ? 1 : 0);
        const keys = Object.keys(input);
        var input_counter = 0;
        keys.forEach((k) => {
            const h = fnvHash(k);
            const hMSB = parseInt(h.slice(0,8), 16);
            const hLSB = parseInt(h.slice(8,16), 16);
            const fArr = flatArray(input[k]);
            
            for (let i=0; i<fArr.length; i++) {
                const arrFr = toArray32(normalize(fArr[i], this.prime), this.n32);
                for (let j=0; j<this.n32; j++) {
                    this.instance.exports.writeSharedRWMemory(j, arrFr[this.n32-1-j]);
                }
                try {
                    this.instance.exports.setInputSignal(hMSB, hLSB, i);
                    input_counter++;
                } catch (err) {
                    throw new Error(\`Not all inputs have been set. Only \${input_counter} out of \${this.instance.exports.getInputSize()}\`);
                }
            }
        });
        
        if (input_counter < this.instance.exports.getInputSize()) {
            throw new Error(\`Not all inputs have been set. Only \${input_counter} out of \${this.instance.exports.getInputSize()}\`);
        }
    }
}

// Builder function to create witness calculator instance
async function builder(code, options) {
    options = options || {};
    
    const wasmModule = await WebAssembly.compile(code);
    
    let wc;
    let errStr = "";
    let msgStr = "";

    const instance = await WebAssembly.instantiate(wasmModule, {
        runtime: {
            exceptionHandler: function(code) {
                let err;
                if (code == 1) {
                    err = "Signal not found.";
                } else if (code == 2) {
                    err = "Too many signals set.";
                } else if (code == 3) {
                    err = "Signal already set.";
                } else if (code == 4) {
                    err = "Assert Failed.";
                } else if (code == 5) {
                    err = "Not enough memory.";
                } else if (code == 6) {
                    err = "Input signal array access exceeds the size.";
                } else {
                    err = "Unknown error.";
                }
                throw new Error(err + errStr);
            },
            printErrorMessage: function() {
                errStr += getMessage() + "\\n";
            },
            writeBufferMessage: function() {
                const msg = getMessage();
                if (msg === "\\n") {
                    console.log(msgStr);
                    msgStr = "";
                } else {
                    if (msgStr !== "") msgStr += " ";
                    msgStr += msg;
                }
            },
            showSharedRWMemory: function() {
                printSharedRWMemory();
            }
        }
    });

    wc = new WitnessCalculator(instance, options.sanityCheck);
    return wc;

    function getMessage() {
        var message = "";
        var c = instance.exports.getMessageChar();
        while (c != 0) {
            message += String.fromCharCode(c);
            c = instance.exports.getMessageChar();
        }
        return message;
    }

    function printSharedRWMemory() {
        const shared_rw_memory_size = instance.exports.getFieldNumLen32();
        const arr = new Uint32Array(shared_rw_memory_size);
        for (let j=0; j<shared_rw_memory_size; j++) {
            arr[shared_rw_memory_size-1-j] = instance.exports.readSharedRWMemory(j);
        }
        if (msgStr !== "") msgStr += " ";
        msgStr += fromArray32(arr).toString();
    }
}
`; 