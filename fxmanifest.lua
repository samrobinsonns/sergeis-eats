fx_version "cerulean"
game "gta5"
lua54 "yes"

title "Sergei Eats - Food Delivery App"
description "A food delivery app for the LB Phone and LB Tablet with QB Core integration."
author "Sergei"

shared_script "config.lua"
client_script "client/**.lua"
server_script "server/**.lua"

files {
    "ui/dist/**",
    "ui/icon.png"
}

-- ui_page "ui/dist/index.html"
ui_page "http://localhost:3000"
