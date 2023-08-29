require('dotenv').config()
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose
  .connect(url)
//eslint-disable-next-line
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
  },
  phone: {
    type: String,
    minlength: 8,

    validate: {
      validator: function (pnum) {
        return /^\d{2,3}-\d{7,8}/.test(pnum)
      },
      message: (props) => `${props.value} is not a valid phone number`,
    },
    required: [true, 'nimen kanssa on oltava puhelinnumero'],
  },
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Contact', contactSchema)
