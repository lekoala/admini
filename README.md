# Admini

> Minimalistic Admin Panel built with Bootstrap 5.2

## Features

- No bloat, only what's strictly required to get a decent admin panel
- A nice, modern, Bootstrap 5 based interface
- A friendly dashboard
- Extended Avatar UI with badges, icons, pictures, groups...
- A powerful action system that supports many use cases (multiple actions, drops, navigation, offcanvas panel...)
- A sane default layout for forms (includes tabbed form support and responsive by default)
- A nice default set of colors that are more accessible
- Super lightweight (57kb with BSN, 94kb with Bootstrap 5)

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
