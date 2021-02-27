const socket = io();

socket.on('message',(message)=>{
    console.log(message);
});

socket.on('shareLocation', (location) => {
    console.log(location);
})

socket.on('rating', (rate) => {
    console.log(rate);
})

document.querySelector('#form1').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.messageId.value;

    socket.emit('sendMessage', message, (error) => {
        if(error){
            return alert(`The sentence "${error}" contains bad words.`);
        }
        console.log('Message delievered.');
    });
});

document.querySelector('#form2').addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = e.target.elements.messageIdRate.value;
    socket.emit('sendRating',rating, (ack) => {
        if(ack){
            return alert(`${ack} is not a number or is not in a range from 0 to 5.`);
        }
        console.log('Rating delievered.');
    })
})

document.querySelector('#btn-loc').addEventListener('click',(e) =>{
    if(!navigator.geolocation){
        return alert('Your browser doen\'t support geolocation.');
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const {coords} = position;
        socket.emit('shareLocation',{
                latitude: coords.latitude,
                longitude: coords.longitude
        }, () => {
            console.log('Location shared.');
        });
    })
});