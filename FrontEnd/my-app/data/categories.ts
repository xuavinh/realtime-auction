const categoriesData = {

    electronics: {
        name: "Điện tử",
        products: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Điện tử ${i + 1}`,
            description: "Danh mục điện tử",
            image:
                "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
        })),
    },

    fashion: {
        name: "Thời trang",
        products: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Thời trang ${i + 1}`,
            description: "Danh mục thời trang",
            image:
                "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
        })),
    },

    vehicles: {
        name: "Xe cộ",
        products: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Xe ${i + 1}`,
            description: "Danh mục xe cộ",
            image:
                "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
        })),
    },

    "real-estate": {
        name: "Bất động sản",
        products: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Bất động sản ${i + 1}`,
            description: "Danh mục bất động sản",
            image:
                "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
        })),
    },

    arts: {
        name: "Nghệ thuật",
        products: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Nghệ thuật ${i + 1}`,
            description: "Danh mục nghệ thuật",
            image:
                "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
        })),
    },

    antiques: {
        name: "Đồ cổ",
        products: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            title: `Đồ cổ ${i + 1}`,
            description: "Danh mục đồ cổ",
            image:
                "https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png",
        })),
    },

};

export default categoriesData;