const mongoose = require('mongoose');
const dns = require('dns').promises;

async function runDiagnostics() {
  const uri = process.env.MONGODB_URI;

  console.log('--- FORMIX AI DATABASE DIAGNOSTICS ---');
  
  if (!uri) {
    console.error('ERROR: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  // Check for placeholder
  if (uri.includes('<db_password>')) {
    console.error('CRITICAL: You still have "<db_password>" in your .env.local.');
    console.log('ACTION: Replace <db_password> with your actual MongoDB Atlas password.');
    process.exit(1);
  }

  console.log('1. Checking DNS Resolution...');
  try {
    const host = uri.split('@')[1].split('/')[0].split('?')[0];
    console.log(`   Host found: ${host}`);
    
    if (host.includes('.mongodb.net')) {
      console.log('   Attempting to resolve SRV records for:', `_mongodb._tcp.${host}`);
      const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${host}`);
      console.log('   SUCCESS: DNS SRV records found:', srvRecords.length);
    }
  } catch (dnsErr) {
    console.error('   DNS FAILURE: Could not resolve SRV records.');
    console.error(`   Details: ${dnsErr.message}`);
    console.log('   TIP: This is likely a local network or ISP issue blocking SRV records.');
  }

  console.log('\n2. Attempting Database Connection...');
  try {
    const start = Date.now();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    console.log(`   SUCCESS: Connected in ${Date.now() - start}ms`);
    process.exit(0);
  } catch (connErr) {
    console.error('   CONNECTION FAILED!');
    console.error(`   Error Code: ${connErr.code}`);
    console.error(`   Error Message: ${connErr.message}`);
    
    if (connErr.message.includes('ECONNREFUSED')) {
      console.log('\nACTION REQUIRED:');
      console.log('1. Go to MongoDB Atlas -> Network Access.');
      console.log('2. Click "Add IP Address" -> "Allow Access From Anywhere" (0.0.0.0/0).');
      console.log('3. Save and wait 1 minute for it to apply.');
    }
    process.exit(1);
  }
}

runDiagnostics();
