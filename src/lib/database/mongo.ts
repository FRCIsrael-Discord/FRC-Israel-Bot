import { Db, MongoClient } from 'mongodb';
import { getMongoURI } from '../../config/config';
import { logError, logInfo } from '../../utils/logger';

const connectionString = getMongoURI() || 'mongodb://127.0.0.1:27017';
let db: Db | undefined;

export async function initDbClient() {
    const client = new MongoClient(connectionString);

    try {
        await client.connect();
    } catch (err) {
        logError('Unable to connect to mongodb: ', err);
    }
    db = client.db('frcisrael-discord');
    logInfo('Connected to MongoDB!');
};

export function getDb() {
    if (!db) {
        throw new Error('Database not initialized!');
    }
    return db;
}