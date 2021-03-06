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

const roomTemplate = document.querySelector('#room-template').innerHTML;
const sidebarComp = document.querySelector('#sidebar-temp');


//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
    //new nessage element
    const $newMessage = $messages.lastElementChild;
    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height
    const visibleHeight = $messages.offsetHeight;
    //height of messages container
    const containerHeight = $messages.scrollHeight;

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a Z, D.MM.YY')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
});

socket.on('roomData', ({room, users}) => {
    console.log(room);
    console.log(users);
    const html = Mustache.render(roomTemplate, {
        room: room,
        users: users,
    });
    sidebarComp.innerHTML = html;
})

socket.on('shareLocation', (message) => {
    console.log(message);
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        location: message.url,
        createdAt: moment(message.createdAt).format('hh:mm a Z, D.MM.YY')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();

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

socket.emit('join', {username, room},(error) => {
    if(error){
        alert(`${error}`);
        location.href = '/'
    }
});