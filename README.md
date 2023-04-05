# Admini

> Minimalistic Admin Panel built with Bootstrap 5.3

## Features

- No bloat, only what's strictly required to get a decent admin panel
- A nice, modern, Bootstrap 5 based interface
- A friendly dashboard
- Extended Avatar UI with badges, icons, pictures, groups...
- A powerful action system that supports many use cases (multiple actions, drops, navigation, offcanvas panel...)
- A sane default layout for forms (includes tabbed form support and responsive by default)
- A nice default set of colors that are more accessible
- Powerful (but optional) ajax navigation
- Super lightweight (around 100kb)
- Dark mode support

## BS Companion

Some features of admini have been extracted to a third party module called [BS Companion](https://bs-companion.vercel.app/)

- Responsive Table : Nice responsive tables without ugly scrollbars
- BS Tabs : Improved tabs, that collapse down to a dropdown and with linkable tabs
- BS Toggle : Self initializing popovers and tabs
- Toaster : Generate beautiful toast message without markup
- Modalizer : Generate beautiful modals without markup
- Form Validator : Consistent validator that works across tabs and accordions

## Form elements

Admini does not provide any built in custom form elements. This is because we are often used to use specifics
libraries based on our usage and personal preferences.

One easy way to bind behaviour to your html nodes is to use [Modular Behaviour](https://github.com/lekoala/modular-behaviour.js).

It works beautifully in combination with [skypack](https://www.skypack.dev/).

## Ajax navigation

The admin panel provides a built-in (but optional) navigation with sco-pe, a custom element made to load page fragments.

Changing from a full page load on each action to a ajax powered navigation as a few side effects that you should not ignore:

- Avoid initializing things multiple time
- But aware of the state
- Cleanup when elements are removed

Avoid initializing things multiple time can be done in three ways:

- Have self initializing custom elements or use [Modular Behaviour](https://github.com/lekoala/modular-behaviour.js).
- Happily trigger full page init with multiple init safe scripts (eg: using initialize util provided)
- Define custom per fragment code with onScopeLoad

You can also ditch sco-pe completely and use a more robust solution like Turbo or Unpoly. I didn't want to use these
libraries because they tend to creep to much into the project architecture. With sco-pe, you can pretty much write
regular html and it will work with minimal changes.

## Icons and images

Icons are powered by [Last Icon](https://github.com/lekoala/last-icon)

Default set is [material icons](https://fonts.google.com/icons)

Images are from [undraw](https://undraw.co/)

## Demo

[Demo is available on Vercel](https://admini.vercel.app/)

## Try at home

### The build setup

Admini use esbuild to compile the js assets. After cloning this repo, simply run

```
npm start
```

And you will get a fully functional local demo to play with.

If you want to work on the css, run in another terminal the following

```
npm run watch-css
```

And your css will be compiled automatically.

No complicated build pipe :-)
