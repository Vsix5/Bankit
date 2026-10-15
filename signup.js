const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', async (e) => {

try{
  e.preventDefault();

const formData = new FormData(signupForm);
const name = formData.get('name');
const email = formData.get('email');
const password = formData.get('password');

function inputValidations(name, email, password){

const nameRegex = /^[\p{L}\s'-]{2,70}$/u;
const emailRegex = /^[A-Za-z0-9.]{4,25}@[A-Za-z]{3,20}[.][A-Za-z]{2,5}$/;
const passwordRegex = /^[\p{L}'0-9@.\-]{9,20}$/u;

const validName = nameRegex.test(name);
const validEmail = emailRegex.test(email);
const validPassword = passwordRegex.test(password);

if(!validName) alert('Invalid Name')
if(!validEmail) alert('Invalid Email')
if(!validPassword) alert('Invalid Password')

  return validName && validEmail && validPassword;
};
const validation = inputValidations(name, email, password);

if(!validation){
  console.log('Please Enter Valid inputs')
  return;
}
const response = await fetch('http://127.0.0.1:3000/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({name, email, password})
})

const data = await response.json();

if(response.ok){
  alert('Account created Successfully');
  window.location.href = 'signin.html'
}
else{
  alert(data.error || 'Something went wrong')
}
}

catch(error){
  console.error('Error', error);
  alert('Check you login Details')
                }
})