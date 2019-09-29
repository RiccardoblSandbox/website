a [gohugo.io](https://gohugo.io) website for the jmonkeyengine.org website.

These files are the content and theme files used to generate flat html files using gohugo.

To use these files:
* Download [gohugo.io](https://gohugo.io/getting-started/installing/).
* execute `git clone https://github.com/jMonkeyEngine/website.git` in the directory containing hugo.
* execute the `hugo` command to compile the files to flat HTML
* execute `hugo server -D` to start a server on localhost:1313

Executing the `hugo` command will compile and publish all files into the `./public` folder.

When you `push` changes to this repository the server will perform a `git pull` and `hugo` command
to compile and publish the changes.
