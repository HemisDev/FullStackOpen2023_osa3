const express = require('express')
const app = express()

app.use(express.json())
var morgan = require('morgan')

morgan.token('bodyMessage',(req,res) => {  
  return JSON.stringify(req.body);
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :bodyMessage'))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    phone: "040-123456",    
  },
  {
    id: 2,
    name: "Ada Lovelace",
    phone: "39-44-5323523",    
  },
  {
    id: 3,
    name: "Dan Abramov",
    phone: "12-43-234345",    
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    phone: "39-23-6423122",    
  }
]



app.get('/', (req, res) => {
  res.send('<h1>Phonebook!</h1>')
})

app.get('/info', (req, res) => {
  const infoPage = GetInfoPage();
  res.send(infoPage)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }  
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.phone) {
    return response.status(400).json({ 
      error: 'name or phone missing!' 
    })
  }
  if (persons.find(person=>person.name === body.name))
  {
    return response.status(400).json({
      error: 'name duplicates are not allowed!'
    })  
  }
  const person = CreateNewPerson(body)  
  persons = persons.concat(person)
  response.json(person)
})

const GetInfoPage =() => {
  const info=`
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    </div>
    `
  return info;
}
const CreateNewPerson = (body) =>{
  const min = 10000000;
  const max = 100000000;
  const randomInt = Math.floor(Math.random() * (max-min+1))+min
  return {
    id: generateId(),
    name: body.name,
    phone: body.phone || `${randomInt}`,   
  }
  
}

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}