const socket = io();

//elements
//form1
const $messageForm = document.querySelector('#form1');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

//form2
const $messageForm1 = document.querySelector('#form2');
const $messageFormInput1 = $messageForm1.querySelector('input');
const $messageFormButton1 = $messageForm1.querySelector('button');

//form3
const $messageForm2 = document.querySelector('#form3');
const $messageFormInput2 = $messageForm2.querySelector('input');
const $messageFormButton2 = $messageForm2.querySelector('button');

//loc button
const $messageButtonLoc = document.querySelector('#btn-loc');

const $messages = document.querySelector('#messages');
const $locations = document.querySelector('#locations');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('h:m:s Z, D. MM. YY')
    });
    $messages.insertAdjacentHTML('beforeend',html);
});

socket.on('shareLocation', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate,{
        location: message.url,
        createdAt: moment(message.createdAt).format('h:m:s Z, D. MM. YY')
    });
    $locations.insertAdjacentHTML('beforeend',html);

})

socket.on('rating', (rate) => {
    console.log(rate);
})

socket.on('email', (email) => {
    console.log(email);
})



$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled','disabled');

    const message = e.target.elements.messageId.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        
        if(error){
            return alert(`The sentence "${error}" contains bad words.`);
        }
        console.log('Message delievered.');
    });
});

document.querySelector('#form2').addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton1.setAttribute('disabled','disbaled');
    const rating = e.target.elements.messageIdRate.value;
    socket.emit('sendRating',rating, (ack) => {
        $messageFormButton1.removeAttribute('disabled');
        $messageFormInput1.value = '';
        $messageFormInput1.focus();

        if(ack){
            return alert(`${ack} is not a number or is not in a range from 0 to 5.`);
        }
        console.log('Rating delievered.');
    })
})

document.querySelector('#form3').addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton2.setAttribute('disabled','disabled');

    const email = e.target.elements.messageIdEmail.value;

    socket.emit('sendEmail', email, (valid) => {
        $messageFormInput2.value = '';
        $messageFormInput2.focus();
        $messageFormButton2.removeAttribute('disabled');

        if(valid){
            return alert(valid);
        }
        console.log('Email has been received');
    })
})

document.querySelector('#btn-loc').addEventListener('click',(e) =>{
    $messageButtonLoc.setAttribute('disabled','disabled');

    if(!navigator.geolocation){
        return alert('Your browser doen\'t support geolocation.');
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const {coords} = position;

        socket.emit('shareLocation',{
                latitude: coords.latitude,
                longitude: coords.longitude
        }, () => {
            $messageButtonLoc.removeAttribute('disabled');
            console.log('Location shared.');
        });
    })
});