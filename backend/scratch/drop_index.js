const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const drop = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const collection = mongoose.connection.collection('attendances');
    console.log('Dropping index residentId_1_date_1...');
    await collection.dropIndex('residentId_1_date_1');
    console.log('Index dropped successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error dropping index:', err.message);
    process.exit(1);
  }
};

drop();
