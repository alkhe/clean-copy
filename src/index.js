import { join, resolve, sep } from 'path'
import { createReadStream as reads, createWriteStream as writes } from 'graceful-fs'
import { mkdir, readdir as ls, lstat, readlink, symlink } from 'fs-promise'

const P = f => new Promise(f)

const mkdirp = dir =>
	mkdir(dir).catch(err => {
		if (err.code !== 'EEXIST') return Promise.reject(err)
	})

const copy_child = (i, o, filter) =>
	lstat(i).then(s => (
		s.isDirectory()
			? copy_dir
		: s.isSymbolicLink()
			? copy_link
			: copy_file
	)(i, o, filter))

const copy_children = (i, o, children, filter) =>
	Promise.all(children.filter(filter).map(child =>
		copy_child(join(i, child), join(o, child), filter)
	))

const copy_dir = (i, o, filter) =>
	mkdirp(o)
		.then(() => ls(i))
		.then(children => copy_children(i, o, children, filter))

const copy_file = (i, o) =>
	P((res, rej) => {
		const r = reads(i)
		const w = writes(o)
	
		r.on('error', rej)
		w.on('error', rej)
	
		w.once('finish', res)
	
		r.pipe(w)
	})

const copy_link = (i, o) => readlink(i).then(link => symlink(link, o))

const contains = (a, b) => {
	a = a.split(sep)
	b = b.split(sep)
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false
		}
	}
	return true
}

export default (i, o, filter = () => true) => {
	i = resolve(i)
	o = resolve(o)
	if (filter.constructor === RegExp) {
		filter = ::filter.test
	}
	return contains(i, o)
		? Promise.reject(new Error('output directory cannot be a child of input directory'))
		: copy_dir(i, o, filter)
}
