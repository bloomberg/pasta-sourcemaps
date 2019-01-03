# Contributing to `pasta-sourcemaps`

We welcome your contributions to help us improve and extend this project!

Below you will find some basic steps required to be able to contribute to the project. If
you have any questions about this process or any other aspect of contributing to a Bloomberg open
source project, feel free to send an email to opensource@bloomberg.net and we'll get your questions
answered as quickly as we can.

## Contribution Licensing

Since `pasta-sourcemaps` is distributed under the terms of the [Apache Version 2 license](LICENSE), contributions that you make
are licensed under the same terms. In order for us to be able to accept your contributions,
we will need explicit confirmation from you that you are able and willing to provide them under
these terms, and the mechanism we use to do this is called a Developer's Certificate of Origin
[DCO](DCO.md).  This is very similar to the process used by the Linux(R) kernel, Samba, and many
other major open source projects.

To participate under these terms, all that you must do is include a line like the following as the
last line of the commit message for each commit in your contribution:

    Signed-Off-By: Random J. Developer <random@developer.example.org>

The simplest way to accomplish this is to add `-s` or `--signoff` to your `git commit` command.

You must use your real name (sorry, no pseudonyms, and no anonymous contributions).

## Steps

- Create an [Issue](https://github.com/bloomberg/pasta-sourcemaps/issues) and explain the proposed change. 
- Ensure your code has no lint errors and passes all tests: 
  - `npm run lint`
  - `npm run build`
  - `npm run test`
- Add new tests or modify exisiting tests to cover your change.
- Submit a Pull Request and link it to the Issue. 

## Help / Documentation

Please see the [README](README.md) to get started.
