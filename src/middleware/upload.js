import multer from 'multer'
import path from 'path'
import fs from 'fs'

function makeStorage(folder) {
  const uploadPath = path.join(process.cwd(), 'uploads', folder)
  fs.mkdirSync(uploadPath, { recursive: true })

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-')
      cb(null, `${Date.now()}-${safeName}`)
    }
  })
}

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WEBP, and PDF files are allowed'))
  }
  cb(null, true)
}

export const govtIdUpload = multer({
  storage: makeStorage('govt-ids'),
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }
})

export const productImageUpload = multer({
  storage: makeStorage('products'),
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }
})
