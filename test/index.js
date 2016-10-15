import chai, { expect } from 'chai'
import chai_fs from 'chai-fs'
import chai_as_promised from 'chai-as-promised'
import copy from '..'
import { existsSync as exists, mkdirSync as mkdir, writeFileSync as write, readFileSync as read, readlinkSync as rlink, symlinkSync as slink } from 'graceful-fs'
import { sync as remove } from 'rimraf'
import { sync as mkdirp } from 'mkdirp'

chai
	.use(chai_fs)
	.use(chai_as_promised)

const setup = () => {
	mkdirp('fixtures')
	write('fixtures/z.txt', '123')
	mkdir('fixtures/a')
	write('fixtures/a/asd.txt', 'abcd\n123\n')
	mkdir('fixtures/a/child-dir')
	write('fixtures/a/child-dir/fgh.txt', 'qwerty\n!@#\n')
	mkdir('fixtures/a/empty-dir')
	slink('fixtures/z.txt', 'fixtures/a/z.lnk')
}

const cleanup = () => {
	remove('fixtures')
}

describe('copy', () => {

	beforeEach(setup)
	afterEach(cleanup)

	it('should copy all children from one directory', () =>
		copy('fixtures/a', 'fixtures/b').then(() => {
			expect('fixtures/b').to.be.a.directory()
			expect('fixtures/b/asd.txt').to.be.a.file()
				.and.have.content('abcd\n123\n')
			expect('fixtures/b/child-dir').to.be.a.directory()
			expect('fixtures/b/child-dir/fgh.txt').to.be.a.file()
				.and.have.content('qwerty\n!@#\n')
			expect('fixtures/b/empty-dir').to.be.a.directory()
				.and.be.empty
			expect(rlink('fixtures/b/z.lnk')).to.be.a.file()
				.and.have.content('123')
		})
	)

	it('should ignore children that do not pass the filter', () =>
		copy('fixtures/a', 'fixtures/b', path => !/^child-dir$/.test(path)).then(() => {
			expect('fixtures/b').to.be.a.directory()
			expect('fixtures/b/asd.txt').to.be.a.file()
				.and.have.content('abcd\n123\n')
			expect('fixtures/b/child-dir').to.not.be.a.path()
			expect('fixtures/b/empty-dir').to.be.a.directory()
				.and.be.empty
			expect(rlink('fixtures/b/z.lnk')).to.be.a.file()
				.and.have.content('123')
		})
	)

	it('should ignore children that do not pass the filter (regex)', () =>
		copy('fixtures/a', 'fixtures/b', /^(child-dir.+|(?!child-dir).*)$/).then(() => {
			expect('fixtures/b').to.be.a.directory()
			expect('fixtures/b/asd.txt').to.be.a.file()
				.and.have.content('abcd\n123\n')
			expect('fixtures/b/child-dir').to.not.be.a.path()
			expect('fixtures/b/empty-dir').to.be.a.directory()
				.and.be.empty
			expect(rlink('fixtures/b/z.lnk')).to.be.a.file()
				.and.have.content('123')
		})
	)

	it('should throw an error when output is a child of input', () => {
		let p = copy('fixtures/a', 'fixtures/a/x')
		return expect(p).to.be.rejectedWith(Error, 'output directory cannot be a child of input directory')
	})
})
