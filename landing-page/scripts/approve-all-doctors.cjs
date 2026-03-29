/**
 * Sets status: 'approved' on every document in Firestore collection `doctors`.
 * Uses the Admin SDK (bypasses security rules).
 *
 * Setup:
 * 1. Firebase Console → Project settings → Service accounts → Generate new private key → save JSON.
 * 2. Windows PowerShell:
 *      $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your-service-account.json"
 *    macOS/Linux:
 *      export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-service-account.json
 * 3. From landing-page folder:
 *      npm run approve-all-doctors
 *
 * Optional: node scripts/approve-all-doctors.cjs --dry-run
 */

const admin = require('firebase-admin')

const dryRun = process.argv.includes('--dry-run')

if (!admin.apps.length) {
  admin.initializeApp({
    /* Uses GOOGLE_APPLICATION_CREDENTIALS when set */
  })
}

async function main() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON file path.')
    process.exit(1)
  }

  const db = admin.firestore()
  const snap = await db.collection('doctors').get()
  if (snap.empty) {
    console.log('No documents in `doctors`.')
    return
  }

  if (dryRun) {
    for (const doc of snap.docs) {
      const st = doc.get('status')
      console.log(doc.id, 'current status:', st ?? '(missing)')
    }
    console.log(`\nDry run: ${snap.size} document(s). Run without --dry-run to update.`)
    return
  }

  let batch = db.batch()
  let inBatch = 0
  let total = 0

  for (const doc of snap.docs) {
    batch.update(doc.ref, {
      status: 'approved',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    inBatch++
    total++
    if (inBatch >= 500) {
      await batch.commit()
      batch = db.batch()
      inBatch = 0
    }
  }

  if (inBatch > 0) {
    await batch.commit()
  }

  console.log(`Updated ${total} doctor document(s) to status "approved".`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
