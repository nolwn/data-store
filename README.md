# Append File Datastore

It's time to make a simple key value store. But instead of fancy B-trees and whatever magicalness, we are just going to use an append-only file.

## Getting started

Clone the repo: `git clone https://github.com/nolwn/data-store.git`
Install the dependencies: `npm i`
Run the tests: `npm test` (they should all fail)

Your code you go in the exported functions in `index.js`. Go make all those tests pass!

## Creating an item

When an item gets added to the store, it just gets appended to the file in a certain special way:

```
3ba0aaa7-546d-4302-94a5-94dacab1591f	This is some important data!

```

The first part of the line is a big string that acts as an id. It's called a UUID which stands for Universally Unique Identifier (I had to Google what it stands for). After the id is a tab break. After that is a bunch of text that is the data. And—and don't you forget it—you need to put a newline.

In order to make this easier, I've made two little helper functions for you. The first is `generateId`. Call it, and it will make you a unique id. Boom

The second is `appendToFile`. It does what it sounds like and nothing more: you give it a sting and it poops it onto the end of the file.

All this will go into a function called `create` (hey, what a **creative** name!) which takes the value you want to store, and returns the key of the item that was created.

## Reading an item

To get an item, you will need to read through each line of the store until you find the line with the key you need. Then you return the data! It should look like this:

```json
{
    "key": "3ba0aaa7-546d-4302-94a5-94dacab1591f",
    "value": "This is some important data!"
}
```

There's a caveat or two, but we'll cover those in other sections.

To lube the gears of this little operation, I done made a helper function. It's called `getLines`. It's a gorgeous thing called a generator, which is a special kind of function so it might look weirdish. But basically, the way you use it is you call it, and it returns a Generator object. It's iterable! What the fuck am I talking about? Well basically it means you can use a `for...of` loop on it.

```js
const lines = getLines(); // it retutns an iterable...

for (const line of lines) {
    // ... which means you can iterate over it!
    // each line is a big ole string like what I showed you all the way back in Chapter One:
    // "Creating an item"
}
```

All this will go into a function called `read` which takes one parameter which is the key of the data you're looking for and returns the data. It should look a bit like this:

```json
{
    "key": "3ba0aaa7-546d-4302-94a5-94dacab1591f",
    "value": "This is some important data!"
}
```

## Updating an item

You can't actually edit anything in an append only file. So how, in that name of God, do you update an item?

To update an item, all you have to do is append a new line to the file that has the same key as the item you are changing. Here is where one of those caveats comes in (hey, that was fast)! When go to read a file, you don't want to grab the first item you find that matches the key, you want to find the last one! To demonstrate imagine this is our data store:

```
45dc8efa-10af-4dc7-998e-9fd89041a48b	This should be updated.
9672c000-7e2e-4480-a372-2bc933640f27	This is kind of filler.
45dc8efa-10af-4dc7-998e-9fd89041a48b	This is the update!

```

If I am searching for `45dc8efa-10af-4dc7-998e-9fd89041a48b`, I want to grab the third item, not the first. Updating an item is just that easy!

All this will go into a function called `update` which takes two paremeter: 1. the key of the item being updated, and 2. the new value. It returns the previous data of the item being updated. So, if you were updating `"This is some important data!"` to say `"This is some even more important data!!"`, then `update` should return...

```json
{
    "key": "3ba0aaa7-546d-4302-94a5-94dacab1591f",
    "value": "This is some important data!"
}
```

...since that is the old value that has just been changed!

## Deleting an item

If you think deleting an item might have another caveat about reading items, you deserve a beer. Because it does. It does involve one of those.

You can't actually delete anything in an append only file. You're probably less scared to hear that than you were when I said basically the same thing in "Updating and item," but you should be a little scared because deleting items involves something with a spoOoOoky name: a tombstone! A tombstone is a marker that you append to the end of the file that just says "this sucker is deleted."

In our case a tombstone looks like this:

```
3ba0aaa7-546d-4302-94a5-94dacab1591f

```

What the heck is that? Well, it's the key of the item you're deleting, followed by a tab, followed by a newline. And that's the caveat: when you see that you know the item is deleted and should not be updated or retrieved anymore. Or deleted again, of course!

All this will go into a function called `delete` which takes one parameter: the key of the item to delete. It returns the entry you deleted so you can admire it one last time before it dies. That might look like this:

```json
{
    "key": "3ba0aaa7-546d-4302-94a5-94dacab1591f",
    "value": "This is some important data!"
}
```

(Hey, that's starting to look familiar...)
