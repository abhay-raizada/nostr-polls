import React from "react";
import {ToggleButtonGroup, ToggleButton, useColorScheme} from "@mui/material";
import {LightMode, SettingsBrightness, DarkMode} from "@mui/icons-material";

export const ColorSchemeToggle: React.FC = () => {
    const {mode, setMode} = useColorScheme()
    return <ToggleButtonGroup value={mode} exclusive onChange={(_, newMode) => setMode(newMode)} aria-label={'color scheme toggle'}>
        <ToggleButton title={'light mode'} value="light" aria-label="light mode">
            <LightMode />
        </ToggleButton>
        <ToggleButton title={'system'} value="system" aria-label="system">
            <SettingsBrightness />
        </ToggleButton>
        <ToggleButton title={'dark mode'} value="dark" aria-label="dark mode">
            <DarkMode />
        </ToggleButton>
    </ToggleButtonGroup>
}