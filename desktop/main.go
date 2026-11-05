package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

// Angular build output (npm run build:desktop / watch:desktop write here).
// Not named "dist" on purpose: with frontend:dir set to "..", Wails would
// otherwise overwrite it with the web build from ../dist before embedding.
//
//go:embed all:frontend/app
var assets embed.FS

func main() {
	err := wails.Run(&options.App{
		Title:     "ArrayThis",
		Width:     1100,
		Height:    720,
		MinWidth:  480,
		MinHeight: 500,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		// Matches the dark theme background to avoid a white flash on startup
		BackgroundColour: &options.RGBA{R: 12, G: 12, B: 14, A: 255},
		Mac: &mac.Options{
			// Hide the title bar; native traffic lights overlay the app header,
			// which the frontend marks as the drag region (--wails-draggable).
			TitleBar: mac.TitleBarHiddenInset(),
			About: &mac.AboutInfo{
				Title:   "ArrayThis",
				Message: "Transforma listas em arrays TypeScript, SQL IN e texto.\nTilt Tecnologia",
			},
		},
	})
	if err != nil {
		log.Fatal(err)
	}
}
