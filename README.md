# Archex

## Experimental packages for ArchLinux build from source.

These are experimental PKGBUILD files built directly from source. Mostly from git. They contain all the latest functionalities and are adapted to be built for a given hardware (thanks to custom `makepkg.conf`).

- **Some packages have an AMD-only configuration. There will be no NVIDIA support.**
- **Install at your own risk, don't touch if you don't know what you're doing. This can mess up your entire system and possibly stop everything working at some point.**

## Usage

There will be no `pacman external repo` for this and if you want to use these packages you can do it in 2 ways.

### Prepare:
- Clone the repository to your own computer.
- Go to: `base/devel/pacman`
- Run: `makepkg -iCcsf`

This will prepare your repository to build and optimize for your hardware.

### 1 method:
Go to the specific folder and build/install the package from the console via `makepkg`.

### 2 method:
Use a ready-made script from this repository that will build and install all packages from a given group for you.

- `./build.sh` - will build and install all packages from the root folder
- `./build.sh gnome` - will build and install all packages in the `gnome` folder
- `./build.sh base/devel` – will build and install all packages from the `base/devel` folder

and so on.






