// seed.js (phiên bản không dùng transaction)

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Category = require('../models/category.model.js');
const Subcategory = require('../models/subcategory.model.js');
const Album = require('../models/album.model.js');

const seedDatabase = async () => {
  try {
    console.log('Bắt đầu quá trình seeding dữ liệu...');

    // 1. Xóa dữ liệu cũ trong các collection
    console.warn('Đang xóa dữ liệu cũ...');
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    await Album.deleteMany({});

    // 2. Đọc dữ liệu từ các file JSON
    console.info('Đang đọc dữ liệu từ các file JSON...');
    const categoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'categories.json'), 'utf-8'));
    const subcategoriesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'subcategories.json'), 'utf-8'));
    const albumsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'albums.json'), 'utf-8'));
    const tracksData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'tracks.json'), 'utf-8'));

    const categoryOldToNewIdMap = new Map();
    const subcategoryOldToNewIdMap = new Map();
    const albumOldToNewIdMap = new Map();

    // 3. Seed Subcategories
    console.info('Đang seed Subcategories...');
    const subcategoriesToInsert = subcategoriesData.subcategories.map(sub => ({
      name: sub.name,
      cover_image: sub.image,
    }));
    // Bỏ { session }
    const createdSubcategories = await Subcategory.insertMany(subcategoriesToInsert);

    subcategoriesData.subcategories.forEach((sub, index) => {
      subcategoryOldToNewIdMap.set(sub.id.toString(), createdSubcategories[index]._id);
    });
    console.log(`-> Đã tạo ${createdSubcategories.length} subcategories.`);

    // 4. Chuẩn bị và Seed Categories
    console.info('Đang seed Categories và các quan hệ...');
    const subcategoriesByCategoryId = {};
    subcategoriesData.subcategories.forEach(sub => {
      const oldCatId = sub.categoryId.toString();
      if (!subcategoriesByCategoryId[oldCatId]) {
        subcategoriesByCategoryId[oldCatId] = [];
      }
      const newSubId = subcategoryOldToNewIdMap.get(sub.id.toString());
      if (newSubId) {
        subcategoriesByCategoryId[oldCatId].push({
          subcategory: newSubId,
          order_number: sub.order ?? 0,
        });
      }
    });

    const categoriesToInsert = categoriesData.categories.map(cat => ({
      name: cat.name,
      order_number: cat.order_by,
      subcategories: subcategoriesByCategoryId[cat.id.toString()] || [],
    }));
    // Bỏ { session }
    const createdCategories = await Category.insertMany(categoriesToInsert);

    categoriesData.categories.forEach((cat, index) => {
      categoryOldToNewIdMap.set(cat.id.toString(), createdCategories[index]._id);
    });
    console.log(`-> Đã tạo ${createdCategories.length} categories.`);

    // 5. Chuẩn bị và Seed Albums
    console.info('Đang seed Albums, nhúng Tracks và các quan hệ...');
    const tracksByAlbumId = {};
    tracksData.tracks.forEach(track => {
      if (track.album_id) {
        const oldAlbumId = track.album_id.toString();
        if (!tracksByAlbumId[oldAlbumId]) {
          tracksByAlbumId[oldAlbumId] = [];
        }
        tracksByAlbumId[oldAlbumId].push({
          name: track.name,
          track_url: track.audio_file.replace('https://apiadmin.qienergy.ai/assets/uploads/', 'https://data.smexapp.com/'),
        });
      }
    });

    const albumsToInsert = albumsData.album.map(album => {
      const oldAlbumId = album.id.toString();
      const subCategoryRefs = album.subCategoryId
        ? Array.from(new Set(album.subCategoryId.split(',')))
          .map(oldSubId => subcategoryOldToNewIdMap.get(oldSubId.trim()))
          .filter(Boolean)
          .map(newSubId => ({ subcategory: newSubId }))
        : [];

      return {
        name: album.title,
        description: album.description,
        cover_image: album.image_path,
        tracks: tracksByAlbumId[oldAlbumId] || [],
        subcategories: subCategoryRefs,
      };
    });
    // Bỏ { session }
    const createdAlbums = await Album.insertMany(albumsToInsert);

    albumsData.album.forEach((album, index) => {
      albumOldToNewIdMap.set(album.id.toString(), createdAlbums[index]._id);
    });
    console.log(`-> Đã tạo ${createdAlbums.length} albums.`);

    console.info('✅ Database seeding hoàn tất thành công!');

  } catch (error) {
    console.error('❌ Seeding thất bại:', error);
    process.exit(1);
  }
};

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Kết nối MongoDB thành công.');
    return seedDatabase();
  })
  .catch(err => console.error('Lỗi kết nối MongoDB:', err))
  .finally(() => {
    mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB.');
  });