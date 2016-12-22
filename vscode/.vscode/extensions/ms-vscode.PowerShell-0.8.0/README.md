# PowerShell Language Support for Visual Studio Code

[![Join the chat at https://gitter.im/PowerShell/vscode-powershell](https://badges.gitter.im/PowerShell/vscode-powershell.svg)](https://gitter.im/PowerShell/vscode-powershell?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This extension provides rich PowerShell language support for [Visual Studio Code](https://github.com/Microsoft/vscode).
Now you can write and debug PowerShell scripts using the excellent IDE-like interface
that Visual Studio Code provides.

## Platform support

- **Windows 7 through 10** with PowerShell v3 and higher
- **Linux** with PowerShell v6 (all PowerShell-supported distribtions)
- **macOS and OS X** with PowerShell v6

Read the [installation instructions](https://github.com/PowerShell/PowerShell/blob/master/docs/learning-powershell/using-vscode.md)
to get more details on how to use the extension on these platforms.

## Features

- Syntax highlighting
- Code snippets
- IntelliSense for cmdlets and more
- Rule-based analysis provided by [PowerShell Script Analyzer](http://github.com/PowerShell/PSScriptAnalyzer)
- Go to Definition of cmdlets and variables
- Find References of cmdlets and variables
- Document and workspace symbol discovery
- Run selected selection of PowerShell code using `F8`
- Launch online help for the symbol under the cursor using `Ctrl+F1`
- Local script debugging and basic interactive console support!

## Example Scripts

There are some example scripts in the extension's `examples` folder that you can
use to discover PowerShell editing and debugging functionality.  Please
check out the included [README.md](https://github.com/PowerShell/vscode-powershell/blob/master/examples/README.md) file to learn more about
how to use them.

This folder can be found at the following path:
```
c:\Users\<yourusername>\.vscode\extensions\ms-vscode.PowerShell-<version>\examples
```
To open/view the extension's examples in Visual Studio Code, run the following from your PowerShell command prompt:
```
code (Get-ChildItem $Home\.vscode\extensions\ms-vscode.PowerShell-*\examples)[-1]
```

## Reporting Problems

If you're having trouble with the PowerShell extension, please follow these instructions
to file an issue on our GitHub repository:

### 1. File an issue on our [Issues Page](https://github.com/PowerShell/vscode-powershell/issues)

Make sure to fill in the information that is requested in the issue template as it
will help us investigate the problem more quickly.

### 2. Capture verbose logs and send them to us

If you're having an issue with crashing or other erratic behavior, add the following
line to your User Settings in Visual Studio Code:

```json
    "powershell.developer.editorServicesLogLevel": "Verbose"
```

Restart Visual Studio Code and try to reproduce the problem.  Once you are done with
that, zip up the logs in the corresponding folder for your operating system:

- **Windows**: `$HOME\.vscode\extensions\ms-vscode.PowerShell-<CURRENT VERSION>\logs`
- **Linux and macOS**: `~/.vscode/extensions/ms-vscode.PowerShell-<CURRENT VERSION>/logs`

You have two options for sending us the logs:

  1. If you are editing scripts that contain sensitive information (intellectual property,
     deployment or administrative information, etc), e-mail the logs directly to
     *daviwil [at] microsoft.com*

  2. If you are editing scripts that don't contain sensitive information, you can drag and
     drop your logs ZIP file into the GitHub issue that you are creating.


## Contributing to the Code

Check out the [development documentation](https://github.com/PowerShell/vscode-powershell/blob/master/docs/development.md) for more details
on how to contribute to this extension!

## Maintainers

- [David Wilson](https://github.com/daviwil) - [@daviwil](http://twitter.com/daviwil)
- [Keith Hill](https://github.com/rkeithhill) - [@r_keith_hill](http://twitter.com/r_keith_hill)

## License

This extension is [licensed under the MIT License](https://github.com/PowerShell/vscode-powershell/blob/master/LICENSE.txt).  Please see the
[third-party notices](https://github.com/PowerShell/vscode-powershell/blob/master/Third Party Notices.txt) file for details on the third-party
binaries that we include with releases of this project.
