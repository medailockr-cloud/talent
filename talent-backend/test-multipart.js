const FormData = require('form-data');
const fs = require('fs');

async function main() {
  const regEmail = `test_${Date.now()}@example.com`;
  const regRes = await fetch('https://talent-git-186968698522.asia-south1.run.app/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `user_${Date.now()}`,
      name: 'Test Uploader',
      email: regEmail,
      password: 'Password123!'
    })
  });

  const regData = await regRes.json();
  const token = regData.token;
  console.log('Got token for user');

  // Create a 1MB dummy file
  const dummyFile = 'dummy_test.mp4';
  fs.writeFileSync(dummyFile, Buffer.alloc(1024 * 1024, 'a'));

  const form = new FormData();
  form.append('title', 'Multipart Fallback Test');
  form.append('description', 'Testing multipart upload');
  form.append('category', 'Dance');
  form.append('subCategory', 'Hip Hop');
  form.append('purpose', 'Performance');
  form.append('location', 'Bengaluru, India');
  form.append('allowJudging', 'true');
  form.append('allowComments', 'true');
  form.append('privacy', 'PUBLIC');
  form.append('video', fs.createReadStream(dummyFile));

  console.log('Sending multipart POST /api/videos...');
  const res = await fetch('https://talent-git-186968698522.asia-south1.run.app/api/videos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    },
    body: form
  });

  console.log('Multipart upload status:', res.status, res.statusText);
  const data = await res.text();
  console.log('Multipart upload response body:', data);

  fs.unlinkSync(dummyFile);
}

main().catch(console.error);

