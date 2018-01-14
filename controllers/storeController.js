const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({message: 'That filetype isn\'t allowed' }, false );
        }
    }
}
exports.storesJson = async (req, res) => {
    const stores = await Store.find();
    res.json(stores);
}

exports.addStore = (req, res) => {
    res.render('editStore', {title: 'Add Store'});
}

exports.upload = multer(multerOptions).fields([{name: 'photo'}, {name:'thumbnail'}]);


exports.resize = async (req, res, next) => {
    // if there is no new file to resize
    if(!req.files){
        next(); //skip to the next middleware
        return;
    }
     const photoShortcut = req.files.photo[0];

     console.log("Photo er" + photoShortcut)
     const extension = photoShortcut.mimetype.split('/')[1];
     req.body.photo = `${uuid.v4()}.${extension}`;
     // then resize
     const photo = await jimp.read(photoShortcut.buffer);
     await photo.resize(800, jimp.AUTO);
     await photo.write(`./public/uploads/${req.body.photo}`);

     const thumbnailShortcut = req.files.thumbnail[0];     
     
     const extension1 = thumbnailShortcut.mimetype.split('/')[1];     
     req.body.thumbnail = `${uuid.v4()}.${extension1}`;
     const thumbnail = await jimp.read(thumbnailShortcut.buffer);
     await thumbnail.resize(50, jimp.AUTO);
     await thumbnail.write(`./public/uploads/${req.body.thumbnail}`)
     //once we have written the photo to our filesystem, keep going!
     next();
}   

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save();
    req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
    const stores = await Store.find();
    console.log(stores);
    //res.json(stores);
    res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
    const store = await Store.findOne({_id: req.params.id});
    res.render('editStore', {title: `Edit ${store.name}`, store});
}

exports.updateStore = async (req, res) => {
    req.body.location.type = "Point";
    const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true, //return new store instead of update
        runValidators: true
    }).exec();
    req.flash('success', `Succesfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`);
    res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res) => {
    //res.json(req.params);
    const store = await Store.findOne({slug: req.params.slug });
    //res.json(store);
    if(!store) {
        next();
    }
    res.render('store', {store, title: store.name});
}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true, $ne: [] };
  
    const tagsPromise = Store.getTagList();
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  
    //res.json([tags, stores])
    res.render('tag', { tags, title: 'Tags', tag, stores });
};

exports.getTagJson = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true, $ne: [] };
  
    const tagsPromise = Store.getTagList();
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  
    res.json(tags);
}

