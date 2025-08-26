import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar({ searchTerm, setSearchTerm, getPosts }) {
    return (
        <View style={styles.searchContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar posts por título ou conteúdo..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={getPosts}
            />
            <TouchableOpacity onPress={getPosts} style={styles.searchButton}>
                <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        margin: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: "#007bff",
        padding: 8,
        borderRadius: 5,
    },
});
