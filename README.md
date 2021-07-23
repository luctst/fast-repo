<div align="center">
  <a href="#">
  	<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy-downsized.gif" alt="Logo project" height="160" />
  </a>
  <br>
  <br>
  <p>
    <b>fast-repo</b>
  </p>
  <p>
     <i>Perform some quick actions on github repository</i>
  </p>
  <p>

[![Build Status](https://travis-ci.com/luctst/fast-repo.svg?branch=master)](https://travis-ci.com/luctst/fast-repo)
[![NPM version](https://img.shields.io/npm/v/fast-repo?style=flat-square)](https://img.shields.io/npm/v/fast-repo?style=flat-square)
[![Package size](https://img.shields.io/bundlephobia/min/fast-repo)](https://img.shields.io/bundlephobia/min/fast-repo)
[![Dependencies](https://img.shields.io/david/luctst/fast-repo.svg?style=popout-square)](https://david-dm.org/luctst/fast-repo)
[![devDependencies Status](https://david-dm.org/luctst/fast-repo/dev-status.svg?style=flat-square)](https://david-dm.org/luctst/fast-repo?type=dev)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Twitter](https://img.shields.io/twitter/follow/luctstt.svg?label=Follow&style=social)](https://twitter.com/luctstt)

  </p>
</div>

---

**Content**

* [Features](##features)
* [Install](##install)
* [Usage](##usage)
* [Exemples](##exemples)
* [Contributing](##contributing)
* [Maintainers](##maintainers)

## Features ✨
* Create fast repository
* Create a folder linked to this github repository
* Delete any repository
* Create simple README.md file
* Generate a .gitignore file depending on the language you're using
* Manage your repository settings
* ...

## Install 🐙
**Globally**
```bash
npm install -g fast-repo
```

> **Note** - We recommend using this version.

**With npx**
```bash
npx fast-repo <commands> [options]
```

## Usage 💡
```bash
fast-repo <commands> [options]
```

### Commands
* **config** [options] - Create the config to be able to perform actions. 
* **create** [options] - Create the repository.

> **Note** - Enter fast-repo --help for more informations about commands and options available.

## Exemples 🖍
**Create configuration folder**
```bash
fast-repo config -c
```
> **Note** - The -c or --create flag start create configuration process.

Once your config command is done you can start create some repository.

**Create github repository**
```bash
fast-repo create -n=repo-name
```
> **Note** - The -n or --name flag is required and allow us to determine the name of your repository.

By entering the create command a series of questions will be asked in particular if you'll like to create a folder linked to the github repository, by default if no `-p`, `--path` flag is present we'll be using the `process.cwd()` function to determine where to create this folder, enter the `-p` flag with a new path to clear the old one.

## Contributing 🍰
Please make sure to read the [Contributing Guide](https://github.com/luctst/fast-repo/blob/master/.github/CONTRIBUTING.md) before making a pull request.
Thank you to all the people who already contributed to this project!

## Maintainers 👷
<table>
  <tr>
    <td align="center"><a href="https://lucastostee.now.sh/"><img src="https://avatars3.githubusercontent.com/u/22588842?s=460&v=4" width="100px;" alt="Tostee Lucas"/><br /><sub><b>Tostee Lucas</b></sub></a><br /><a href="#" title="Code">💻</a></td>
  </tr>
</table>

## License ⚖️
MIT

---
<div align="center">
	<b>
		<a href="https://www.npmjs.com/package/get-good-readme">File generated with get-good-readme module</a>
	</b>
</div>
