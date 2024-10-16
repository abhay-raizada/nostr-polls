import React from "react";
import {ToggleButtonGroup, ToggleButton, useColorScheme} from "@mui/material";
import {LightMode, SettingsBrightness, DarkMode} from "@mui/icons-material";

export const ColorSchemeToggle: React.FC = () => {
    const {mode, setMode} = useColorScheme()
    return <ToggleButtonGroup value={mode} exclusive onChange={(_, newMode) => setMode(newMode)} aria-label={'color scheme toggle'}>
        <ToggleButton disabled value="light" aria-label="light mode">
            <LightMode />
        </ToggleButton>
        <ToggleButton value="system" aria-label="system">
            <SettingsBrightness />
        </ToggleButton>
        <ToggleButton disabled value="dark" aria-label="dark mode">
            <DarkMode />
        </ToggleButton>
    </ToggleButtonGroup>
}