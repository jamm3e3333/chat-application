const socket = io();

//elements
//form1
const $messageForm = document.querySelector('#form1');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

//loc button
const $messageButtonLoc = document.querySelector('#btn-loc');

//Templates
const $messages = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss Z, D. MM. YY')
    });
    $messages.insertAdjacentHTML('beforeend',html);
});

socket.on('shareLocation', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate,{
        location: message.url,
        createdAt: moment(message.createdAt).format('hh:mm:ss Z, D. MM. YY')
    });
    $messages.insertAdjacentHTML('beforeend',html);

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