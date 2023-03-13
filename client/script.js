import bot from './assets/robogirl.png'
import user from './assets/user.svg'
import girl from './assets/user-avatar.png'

setTimeout(function() {
  document.getElementById('floating').remove()
}, 10000);

//vtuber web integration
const cubism2Model = 'https://cdn.jsdelivr.net/gh/danieladebanjo55/vtuber@vtuber/ldd.model3.json'

;(async function main() {
  const app = new PIXI.Application({
    view: document.getElementById('canvas'),
    autoStart: true,
    resizeTo: window,
    backgroundColor: 0x090909,
  })

  const model2 = await PIXI.live2d.Live2DModel.from(cubism2Model)

  app.stage.addChild(model2)

  model2.scale.set(0.083)
  // model.scale.set(Math.min(scaleX, scaleY));
  model2.x = (innerWidth - model2.width) / 2;
  // model2.expression()
})()

//vtuber web integration end

const clearButton = document.getElementById('clear-button')
clearButton.addEventListener('click', () => {
  chatContainer.innerHTML = ''
})

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.'

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = ''
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId) {
  return `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : girl} 
                      alt="${isAi ? 'bot' : 'girl'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // to clear the textarea input
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId)

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight

  // specific message div
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)

  const response = await fetch('https://vtuber-chatbot.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ' '

  if (response.ok) {
    const data = await response.json()
    const parsedData = data.bot.trim() // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData)
  } else {
    const err = await response.text()

    messageDiv.innerHTML = 'Something went wrong'
    alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})

if (messageDiv.innerHTML.length >= 5) {
  model2.expression();
}