import {
    TextInput,
    TouchableOpacity,
    View,
    Text,
    Image,
    Alert,
    Button,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker"; // <-- Novo
import { uploadImage } from "../utils/uploadImage";

export default function CreatePostContainer({
    setIsSubmitting,
    signOut,
    currentUserId,
    getPosts,
    isSubmitting,
}) {
    const pickPostImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3], // Ajuste conforme preferir
            quality: 0.8,
        });

        if (!result.canceled) {
            setNewPostImageUri(result.assets[0].uri);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            Alert.alert(
                "Erro",
                "Título e conteúdo do post não podem ser vazios."
            );
            return;
        }
        setIsSubmitting(true);

        try {
            const userToken = await AsyncStorage.getItem("userToken");
            if (!userToken) {
                Alert.alert(
                    "Erro de Autenticação",
                    "Você precisa estar logado para criar um post."
                );
                signOut();
                return;
            }

            let imageUrlToSave;
            if (newPostContent) {
                imageUrlToSave = await uploadImage({
                    currentUserId,
                    newPostImageUri,
                    userToken,
                });
                if (!imageUrlToSave) {
                    setIsSubmitting(false);
                    return;
                }
            }

            await api.post(
                "/posts",
                {
                    title: newPostTitle,
                    content: newPostContent,
                    image_url: imageUrlToSave,
                }, // Envia a URL da imagem
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            Alert.alert("Sucesso", "Post criado com sucesso!");
            setNewPostTitle("");
            setNewPostContent("");
            setNewPostImageUri(null); // Limpa a imagem selecionada
            getPosts(); // Recarrega os posts
        } catch (error) {
            console.error(
                "Erro ao criar post:",
                error.response?.data || error.message
            );
            Alert.alert(
                "Erro ao Criar Post",
                error.response?.data?.message ||
                    "Ocorreu um erro ao criar o post."
            );
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                signOut();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImageUri, setNewPostImageUri] = useState(null);

    return (
        <View style={styles.createPostContainer}>
            <TextInput
                style={styles.input}
                placeholder="Título do seu post"
                value={newPostTitle}
                onChangeText={setNewPostTitle}
            />
            <TextInput
                style={[
                    styles.input,
                    { height: 100, textAlignVertical: "top" },
                ]}
                placeholder="O que você quer compartilhar?"
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
            />
            <TouchableOpacity
                onPress={pickPostImage}
                style={styles.imagePickerButton}
            >
                <Ionicons name="image-outline" size={24} color="#007bff" />
                <Text style={styles.imagePickerButtonText}>
                    Adicionar Imagem
                </Text>
            </TouchableOpacity>
            {newPostImageUri && (
                <Image
                    source={{ uri: newPostImageUri }}
                    style={styles.previewImage}
                />
            )}
            <Button
                title={isSubmitting ? "Publicando..." : "Criar Post"}
                onPress={handleCreatePost}
                disabled={isSubmitting}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    createPostContainer: {
        backgroundColor: "#fff",
        padding: 20,
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
    },
    imagePickerButton: {
        // Novo estilo
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e9f5ff",
        padding: 10,
        borderRadius: 5,
        justifyContent: "center",
        marginBottom: 10,
    },
    imagePickerButtonText: {
        // Novo estilo
        marginLeft: 10,
        color: "#007bff",
        fontWeight: "bold",
    },
    previewImage: {
        // Novo estilo
        width: "100%",
        height: 150,
        borderRadius: 8,
        resizeMode: "cover",
        marginBottom: 10,
    },
});
