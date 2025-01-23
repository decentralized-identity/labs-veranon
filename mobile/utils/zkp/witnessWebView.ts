import { witnessCalculatorCode } from './witnessCalculator';

export function getWitnessWebViewContent() {
  return `
  <html>
    <head>
      <script>
        ${witnessCalculatorCode}

        async function generateWitness(wasmBase64, input) {
          try {
            const binary = base64ToArrayBuffer(wasmBase64);
            const witnessCalculator = await builder(binary);
            const witness = await witnessCalculator.calculateWTNSBin(input);
            const witnessBase64 = arrayBufferToBase64(witness);
            window.ReactNativeWebView.postMessage(JSON.stringify({ witness: witnessBase64 }));
          } catch (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              error: err.message,
              stack: err.stack 
            }));
          }
        }

        // Helper functions
        function base64ToArrayBuffer(base64) {
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes.buffer;
        }

        function arrayBufferToBase64(buffer) {
          const binary = Array.from(new Uint8Array(buffer))
            .map(b => String.fromCharCode(b))
            .join('');
          return btoa(binary);
        }
      </script>
    </head>
    <body>
      <div>Ready for witness generation...</div>
    </body>
  </html>
  `;
} 