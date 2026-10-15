const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
try{
  e.preventDefault();
  const formData = new FormData(loginForm);
  const email = formData.get('email');
  const password = formData.get('password');

  const response = await fetch('http://127.0.0.1:3000/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email, password}),
    credentials: 'include'
  })

  const data = await response.json();
  if(response.ok){
   alert('Logged In Successfully.')
   window.location.href="dashboard.html"
  }
  else {
    alert('Login Failed, Please try again to continue.');
  }
}
catch(error){
  console.error('Error', error);
  alert('Cannot connect to the server.')
}
})