document.addEventListener('DOMContentLoaded', async () => {

  try{
   
      const response = await fetch('http://127.0.0.1:3000/dashboard', {
        credentials: 'include'
      });

      const data = await response.json();

      if(response.ok){
        document.getElementById('welcome-msg').textContent = `Welcome ${data.user.name}!`;
      }
      else{
        window.location.href = 'signin.html'
      }
  }
  catch(error){
    console.log('Session Check Failed', error);
  window.location.href = 'signin.html'
  }
})




document.getElementById('logout-btn').addEventListener('click', async () => {
try{
const response = await fetch('http://127.0.0.1:3000/logout', {
  method: 'POST',
  credentials: 'include'
});
if(response.ok){
  alert('Logged out successfully');
  window.location.href = 'signin.html';
}
else {
  alert('Error Logging out, Please try again.')
  window.location.href = 'signin.html'
};
}

catch(error){
  console.error('Server Error', error);
}
})