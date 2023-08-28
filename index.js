const Contact = require('./models/contact')
const express = require('express')
const app = express()

app.use(express.static('dist'))
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

app.get('/', (req, res) => {
  res.send('<h1>Front is not running!</h1>')
})

app.get('/info', async (req, res, next) => {
  try{
  const infoPage = await GetInfoPage();  
  res.send(infoPage)
  } catch(error){
    next(error)
  }
  
})

app.get('/api/persons', (req, res, next) => {
  Contact.find({}).then(con => {
    res.json(con)
  })
  .catch(error => next(error))  
})

app.get('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id)
  .then(con=>{
    if(con) {
      response.json(con)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))          
})

app.delete('/api/persons/:id', (request, response, next) => {
  Contact.findOneAndDelete(request.params.id)
  .then(result=> {
    response.status(204).end()
  })
  .catch(error=>next(error)) 
  
})
app.put('/api/persons/:id', (request, response, next) => {
  const {name, phone} = request.body  

  Contact.findByIdAndUpdate(
    request.params.id, 
    {name, phone}, 
    {new:true, runValidators: true, context: 'query'}
  )
    .then(updatedContact=>{
      response.json(updatedContact)
    })
    .catch(error=>next(error))                    
})
app.post('/api/persons', (request, response,next) => {
  const body = request.body

  if (!body.name || !body.phone) {
    return response.status(400).json({ 
      error: 'name or phone missing!' 
    })
  }  

  const contact = new Contact({
    name: body.name,
    phone: body.phone
  })

  contact.save().then(savedContact => {
    response.json(savedContact)
  })
  .catch(error=>next(error))
})

const GetInfoPage =async () => {  
  try{
  const count = await Contact.countDocuments({})

  const info=`
    <div>
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
    </div>
    `
  return info; 
  } catch(error) {
    throw error;
  }
}
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)