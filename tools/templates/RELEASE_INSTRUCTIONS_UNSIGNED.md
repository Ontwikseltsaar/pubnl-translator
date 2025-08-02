### How to install the developer build of PubNL Translator

There are two ways to install the developer build, depending on the version of Firefox.

Firefox (as a temporary add-on):

1. Go to `about:debugging`.
2. Click "This Firefox".
3. Click "Load Temporary Add-on...".
4. Select `%xpi_file%`.

Firefox Developer Edition:

1. Go to `about:config` and accept any warnings that appear.
2. In the search bar, type `xpinstall.signatures.required`.
3. The value of `xpinstall.signatures.required` should be `false`. If it's `true`, double-click it to change it to `false`.
4. Go to `about:addons`.
5. Drag `%xpi_file%` into the `about:addons` window.
