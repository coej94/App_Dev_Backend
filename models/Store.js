const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name!'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
      type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String,
    thumbnail: String
});

storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')){
        next();//Skip this.
        return;//stop this function
    }
    this.slug = slug(this.name);
    // find other stores that have a slug of bar, bar-1 (^=starts with, ?=optional, $= ends with)
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
    if(storesWithSlug.length) {
      this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }
    next();
    // TODO make more resiliant so slugs are unique
});

storeSchema.statics.getTagList = function () {
    return this.aggregate([
        //aggregation (pipelining) - see mongo docs ($ means it is a field in my document)
        { $unwind: '$tags' }, //split dem op
        { $group: {_id: '$tags', count: { $sum: 1} } }, // smid dem i grupper efter tags og sæt tæller på.
        { $sort: {count: -1 } } // sortér efter tæller med størst antal først
    ]);
}
module.exports = mongoose.model('Store', storeSchema);
