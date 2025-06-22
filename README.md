## What is Em?

**[Em](https://github.com/topdown/em/)** was origonally [Upterm](https://github.com/railsware/upterm/) and I had a fork and been using it for many years.

But it has over time become very outdated, so I have spent the time updating it and fixing bugs, along with adding new features.

**[Em](https://github.com/topdown/em/)** (formerly Upterm) is an IDE in the world of terminals. Strictly speaking, it's both a
terminal emulator and an _interactive_ shell based on [Electron](https://www.electronjs.org/).

![](README/main.png)

## Features

- Autocompletion
- Tabs
- Session management
- Split screens
- Session history search

**[Em](https://github.com/topdown/em/)** shows the autocompletion box as you type and tries to be smart about what to suggest.
Often you can find useful additional information on the right side of the autocompletion, e.g. expanded alias value,
command descriptions, value of the previous directory (`cd -`), etc.

All command-line programs (including emacs, ssh and vim) should work as expected.

## Technologies

- [Electron](https://www.electronjs.org/)
- [TypeScript](http://www.typescriptlang.org/)
- [ReactJS](https://facebook.github.io/react/)

## More Screenshots

![](README/npm_autocompletion.png)
![](README/error.png)
![](README/top_autocompletion.png)
![](README/json_prettyfier.png)
![](README/vim.png)
![](README/emacs.png)
![](README/htop.png)
![](README/cd.png)

## Development Setup

```bash
git clone https://github.com/topdown/em.git

cd em

npm install

npm start
```

Instructions are available for [debugging the application in Visual Studio Code](docs/vscodedebugging.md).

To create a standalone application, execute `npm run pack` in the project directory.

## Contributing

See [Contributing Guide](CONTRIBUTING.md).

## License

[The MIT License](LICENSE).
