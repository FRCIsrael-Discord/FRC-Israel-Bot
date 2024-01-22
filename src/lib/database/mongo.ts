import { Db, MongoClient } from 'mongodb';
import { getMongoURI } from '../../utils/config';
import { logError, logInfo } from '../../utils/logger';

const connectionString = getMongoURI() || 'mongodb://127.0.0.1:27017';
let db: Db | undefined;

export const initDbClient = async () => {
    const client = new MongoClient(connectionString);

    try {
        await client.connect();
    } catch (err) {
        logError('Unable to connect to mongodb: ', err);
    }
    db = client.db('frcisrael-discord');
    logInfo('Connected to MongoDB!');
};

export default db;