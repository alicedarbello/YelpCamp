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
    for (let i=0; i < 200; i ++){
        const randomCities = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // user banana - banana
            author: '6879799bb131a9efed7237b0',
            location: `${cities[randomCities].city}, ${cities[randomCities].state}`,
            title: `${sample(descriptors)}, ${sample(places)}` ,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[randomCities].longitude,
                    cities[randomCities].latitude
                ]
            },
            images: [
                {
                url: 'https://res.cloudinary.com/dsvbf6yrb/image/upload/v1753375582/YelpCamp/csnvsrrw8vs60r8kaahl.webp',
                filename: 'YelpCamp/csnvsrrw8vs60r8kaahl',
                },
                {
                url: 'https://res.cloudinary.com/dsvbf6yrb/image/upload/v1753375583/YelpCamp/xa7ca3jiony7vwr01vhf.jpg',
                filename: 'YelpCamp/xa7ca3jiony7vwr01vhf',
                }
            ],            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum dolorum asperiores quis voluptatem saepe ad vel dolorem quos dolores ipsa consequatur vero, recusandae mollitia cum esse placeat cupiditate impedit unde. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum dolorum asperiores quis voluptatem saepe ad vel dolorem quos dolores ipsa consequatur vero, recusandae mollitia cum esse placeat cupiditate impedit unde.',
            price
        })
        
            
        await camp.save()
    }
}

seedDB().then(()=>{
// fecha a conexão com mongo depois de conectado.
    mongoose.connection.close()
})
