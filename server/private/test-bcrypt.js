import bcrypt from 'bcrypt';

async function testBcrypt() {
    const password = "password123";
    
    // Hash the same password twice
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);
    
    console.log('Original password:', password);
    console.log('First hash:', hash1);
    console.log('Second hash:', hash2);
    console.log('Are hashes different?', hash1 !== hash2);
    
    // Verify both hashes work with the original password
    const isValid1 = await bcrypt.compare(password, hash1);
    const isValid2 = await bcrypt.compare(password, hash2);
    
    console.log('\nCan we still verify the password?');
    console.log('First hash validates:', isValid1);
    console.log('Second hash validates:', isValid2);
}

testBcrypt(); 