import os

import cv2
import numpy as np


def main() -> None:
    window_name = "Janela"

    img_dir = os.scandir("./imagensDados")
    for img_file in img_dir:
        cv2.namedWindow(window_name, cv2.WINDOW_GUI_NORMAL)
        img = cv2.imread(img_file.path)

        # Pré-processamento
        img = cv2.GaussianBlur(img, (3, 3), 5)  # Remoção de ruído
        img = cv2.Canny(img, 150, 200, L2gradient=True)  # Binarização da imagem

        # Reconhecimento de padrões circulares na imagem
        circles = cv2.HoughCircles(
            img,
            cv2.HOUGH_GRADIENT,
            1,  # Escala da imagem
            10,  # Distância mínima entre os centros dos circulos
            minRadius=0,  # Raio mínimo dos círculos
            maxRadius=12,  # Raio máximo dos círculos
            param1=200,  # Limiar de detecção
            param2=15,  # Acumulador de detecção
        )
        circles_list = np.around(circles).astype(np.int32)[0]

        # Criação destaques circulares
        for circle in circles_list:
            x, y, raio = circle
            cv2.circle(img, (x, y), raio, (125, 125, 125), 2)

        print(f"Resultado ({img_file.name}): {len(circles[0])}")

        cv2.imshow(window_name, img)
        if cv2.waitKey(0) == ord("q"):
            cv2.destroyAllWindows()
    
    img_dir.close()
    

if __name__ == "__main__":
    main()
