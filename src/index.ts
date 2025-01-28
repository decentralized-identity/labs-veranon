import express from 'express';
import knex from 'knex';
import config from '../knexfile';

const app = express();
const port = process.env.PORT || 3000;
const db = knex(config);

const database_name = 'identity_data'

app.use(express.json());

// Simple API key validation middleware
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Admin key validation middleware
const validateAdminKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey === process.env.ADMIN_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }
};

app.post('/register-identity', validateApiKey, async (req, res) => {
  try {
    const { identityUrl, identityCommitment } = req.body;
    
    if (!identityUrl || !identityCommitment) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if identity exists
    const existing = await db(database_name)
      .where('identity_url', identityUrl)
      .first();

    let result;
    if (existing) {
      // Update existing record
      [result] = await db(database_name)
        .where('identity_url', identityUrl)
        .update({
          new_identity_commitment: identityCommitment,
          is_processed: false,
          updated_at: db.fn.now()
        })
        .returning(['id']);
      
      res.status(200).json({ success: true, id: result.id, updated: true });
    } else {
      // Insert new record
      [result] = await db(database_name)
        .insert({
          identity_url: identityUrl,
          current_identity_commitment: identityCommitment,
          is_processed: false
        })
        .returning(['id']);
      
      res.status(201).json({ success: true, id: result.id, updated: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all unprocessed identity records (admin route)
app.get('/unprocessed-identities', validateAdminKey, async (req, res) => {
  try {
    const records = await db(database_name)
      .select(
        'id',
        'identity_url',
        'current_identity_commitment',
        'new_identity_commitment',
        'created_at',
        'updated_at'
      )
      .where('is_processed', false)
      .orderBy('created_at', 'desc');
    
    res.status(200).json({
      success: true,
      count: records.length,
      records: records
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark identities as processed (admin route)
app.post('/mark-processed', validateAdminKey, async (req, res) => {
  try {
    const { identityCommitments } = req.body;
    
    if (!Array.isArray(identityCommitments) || identityCommitments.length === 0) {
      res.status(400).json({ error: 'Must provide array of identity commitments' });
      return;
    }

    await db.transaction(async (trx) => {
      // Update all specified records
      await trx(database_name)
        .whereIn('current_identity_commitment', identityCommitments)
        .update({
          is_processed: true,
          processed_at: trx.fn.now(),
          // If there's a new commitment, move it to current
          current_identity_commitment: trx.raw(`
            CASE 
              WHEN new_identity_commitment IS NOT NULL 
              THEN new_identity_commitment 
              ELSE current_identity_commitment 
            END
          `),
          new_identity_commitment: null,
          updated_at: trx.fn.now()
        });
    });

    res.status(200).json({ 
      success: true, 
      message: `Processed ${identityCommitments.length} identities`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});