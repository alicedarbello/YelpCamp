const mongoose = require('mongoose');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected!")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({})
    for (let i=0; i < 50; i ++){
        const randomCities = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[randomCities].city}, ${cities[randomCities].state}`,
            title: `${sample(descriptors)}, ${sample(places)}` ,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum dolorum asperiores quis voluptatem saepe ad vel dolorem quos dolores ipsa consequatur vero, recusandae mollitia cum esse placeat cupiditate impedit unde. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum dolorum asperiores quis voluptatem saepe ad vel dolorem quos dolores ipsa consequatur vero, recusandae mollitia cum esse placeat cupiditate impedit unde.',
            price
        })
        
            
        await camp.save()
    }
}

seedDB().then(()=>{
// fecha a conexão com mongo depois de conectado.
    mongoose.connection.close()
})
