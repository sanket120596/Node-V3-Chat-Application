const socket = io();

// socket.on('countUpdated',(count)=>{
//    alert(`updated count ${count}`)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix : true})

const autoScroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild

  //Height of the last message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  //Visible height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}


socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate,{
  'username':message.username,
  'message':message.text,
  'createdAt': moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoScroll()
});


socket.on("sendLocation", (location) => {
  const html = Mustache.render(locationTemplate,{
  'username':location.username,
  'location':location.location,
  'createdAt': moment(location.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoScroll()
});


$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //const message = document.querySelector('input').value;
  const message = e.target.elements.message.value;
  if (message && message.trim()) {
    $messageFormButton.setAttribute("disabled", "disabled");
    socket.emit("sendMessage", message, (response) => {
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus();
    });
  }
  $messageFormInput.focus()
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("GeoLocation not supported by your browser.!");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (response) => {
      }
    );
  });
});

socket.emit('join',{username,room},(error)=>{
  if(error){
    alert(error)
    location.href = '/'
  }
})


socket.on('roomData',({room ,users})=>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})