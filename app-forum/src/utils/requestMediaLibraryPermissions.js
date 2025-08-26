import * as ImagePicker from "expo-image-picker"; // <-- Novo
import { Alert } from "react-native";

export const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
        Alert.alert(
            "Permissão Negada",
            "Desculpe, precisamos de permissões de galeria para isso funcionar!"
        );
    }
};
