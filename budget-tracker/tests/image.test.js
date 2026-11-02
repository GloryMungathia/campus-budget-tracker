import { test } from 'node:test';
import assert from 'node:assert/strict';
import { photoFileError, squareCrop, initials, PHOTO_MAX_BYTES } from '../src/lib/image.js';

test('photo file checks', () => {
  assert.equal(photoFileError(null), 'Choose a photo');
  assert.equal(photoFileError({ type: 'application/pdf', size: 100 }), 'Use a JPG, PNG or WebP photo');
  assert.equal(photoFileError({ type: 'image/gif', size: 100 }), 'Use a JPG, PNG or WebP photo');
  assert.equal(photoFileError({ type: 'image/png', size: PHOTO_MAX_BYTES + 1 }), 'Photo must be 5 MB or smaller');
  assert.equal(photoFileError({ type: 'image/jpeg', size: 2000 }), '');
  assert.equal(photoFileError({ type: 'image/webp', size: PHOTO_MAX_BYTES }), '');
});

test('square crop takes the middle of the photo', () => {
  assert.deepEqual(squareCrop(400, 200), { sx: 100, sy: 0, side: 200 });
  assert.deepEqual(squareCrop(200, 500), { sx: 0, sy: 150, side: 200 });
  assert.deepEqual(squareCrop(300, 300), { sx: 0, sy: 0, side: 300 });
});

test('initials from a name', () => {
  assert.equal(initials('Njeri Wambui Kamau'), 'NK');
  assert.equal(initials('njeri'), 'N');
  assert.equal(initials('  '), '?');
  assert.equal(initials(), '?');
});
