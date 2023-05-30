for D in ./$1/*/; do
    if [ -d "$D" ]; then
        if [ -f "$D/PKGBUILD" ]; then
            echo "Build: $D."

            (cd "$D" && 
            PKGREL=$(grep -m 1 "^pkgrel=" PKGBUILD | cut -d "=" -f2)
            PKGREL=$((${PKGREL} + 1))
            sed -i "s/^pkgrel=.*/pkgrel=${PKGREL}/" PKGBUILD
            paru -U --localrepo --skipreview --rebuild)
        else
            echo "No PKGBUILD found in $D."
        fi
    fi
done
