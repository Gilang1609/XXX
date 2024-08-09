document.querySelectorAll('.pagination .page').forEach(page => {
    page.addEventListener('click', function() {
        document.querySelector('.pagination .active').classList.remove('active');
        this.classList.add('active');
        // Load the appropriate articles based on the page number
        currentPage = parseInt(this.innerText); // Update current page
        fetchPosts(currentPage, itemsPerPage, sortOrder);
    });
});

let lastScrollTop = 0;
const header = document.getElementById('main-header');
const banner = document.querySelector('.banner-image img'); // Make sure the selector matches your HTML

if (header) {
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hiding logic
        if (scrollTop > lastScrollTop) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollTop = scrollTop;

        // Banner parallax effect
        if (banner) { // Check if banner exists before applying style
            banner.style.transform = 'translateY(' + (scrollTop * 0.5) + 'px)';
        } else {
            console.log('Banner element not found');
        }
    });
} else {
    console.log('Header element not found');
}

let currentPage = 1;
let itemsPerPage = 10;
let sortOrder = '-published_at';

function fetchPosts(page = 1, size = 10, sort = '-published_at') {
    const apiUrl = `https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${page}&page[size]=${size}&append[]=small_image&append[]=medium_image&sort=${sort}`;

    fetch(apiUrl, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('API Response:', data); // Log the API response
        renderPosts(data);
        if (data.meta) {
            renderPagination(data.meta); // Pass the meta directly
            updateTotalItems(data.meta.total); // Update total items count
        } else {
            console.log('Meta data is missing in API response:', data);
        }
    })
    .catch(error => console.error('Error fetching posts:', error));
}

function renderPosts(data) {
    const postList = document.querySelector('.articles');
    postList.innerHTML = '';

    if (Array.isArray(data.data)) {
        const fragment = document.createDocumentFragment();
        data.data.forEach(post => {
            // Access image URL
            const imageUrl = (post.small_image && post.small_image.length > 0)
                ? post.small_image[0].url
                : (post.medium_image && post.medium_image.length > 0)
                    ? post.medium_image[0].url
                    : 'default-image-url'; // Placeholder if no image

            // Log the image URL
            console.log('Image URL:', imageUrl);

            // Create post card element
            const postCard = document.createElement('div');
            postCard.classList.add('article');
            
            postCard.innerHTML = `
                <img src="${imageUrl}" loading="lazy" alt="${post.title}">
                <div class="article-info">
                    <span class="date">${new Date(post.published_at).toLocaleDateString()}</span>
                    <h3>${post.title}</h3>
                </div>
            `;

            fragment.appendChild(postCard);
        });
        postList.appendChild(fragment);
    } else {
        console.log('No posts found or incorrect data format');
    }
}

function renderPagination(meta) {
    console.log('Pagination meta:', meta); // Add this line to debug

    const paginationElement = document.querySelector('.pagination');
    paginationElement.innerHTML = '';

    if (meta && meta.last_page) {
        const fragment = document.createDocumentFragment();

        // Number of buttons to display
        const maxButtons = 5;
        let startPage, endPage;

        // Determine the range of pages to display
        if (meta.last_page <= maxButtons) {
            startPage = 1;
            endPage = meta.last_page;
        } else {
            const halfMaxButtons = Math.floor(maxButtons / 2);
            if (meta.current_page <= halfMaxButtons) {
                startPage = 1;
                endPage = maxButtons;
            } else if (meta.current_page + halfMaxButtons >= meta.last_page) {
                startPage = meta.last_page - maxButtons + 1;
                endPage = meta.last_page;
            } else {
                startPage = meta.current_page - halfMaxButtons;
                endPage = meta.current_page + halfMaxButtons;
            }
        }

        // Add Previous button
        const prevButton = document.createElement('button');
        prevButton.classList.add('prev');
        prevButton.textContent = '«';
        prevButton.disabled = meta.current_page === 1;
        prevButton.addEventListener('click', () => {
            if (meta.current_page > 1) {
                fetchPosts(meta.current_page - 1, itemsPerPage, sortOrder);
            }
        });
        fragment.appendChild(prevButton);

        // Add page buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageLink = document.createElement('button');
            pageLink.classList.add('page');
            if (i === meta.current_page) {
                pageLink.classList.add('active');
            }
            pageLink.innerText = i;
            pageLink.addEventListener('click', () => {
                currentPage = i;
                fetchPosts(currentPage, itemsPerPage, sortOrder);
            });
            fragment.appendChild(pageLink);
        }

        // Add Next button
        const nextButton = document.createElement('button');
        nextButton.classList.add('next');
        nextButton.textContent = '»';
        nextButton.disabled = meta.current_page === meta.last_page;
        nextButton.addEventListener('click', () => {
            if (meta.current_page < meta.last_page) {
                fetchPosts(meta.current_page + 1, itemsPerPage, sortOrder);
            }
        });
        fragment.appendChild(nextButton);

        paginationElement.appendChild(fragment);
    } else {
        console.log('Pagination meta is missing or incorrect format', meta);
    }
}


function updateTotalItems(total) {
    document.getElementById('total-items').textContent = `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, total)} of ${total}`;
}

document.getElementById('sort-by').addEventListener('change', function() {
    sortOrder = this.value;
    fetchPosts(currentPage, itemsPerPage, sortOrder);
});

document.getElementById('show-per-page').addEventListener('change', function() {
    itemsPerPage = parseInt(this.value);
    currentPage = 1; // Reset to page 1
    fetchPosts(currentPage, itemsPerPage, sortOrder);
});

fetchPosts();

document.addEventListener('DOMContentLoaded', function() {
    // Ambil URL halaman saat ini
    var currentPath = window.location.pathname;
    
    // Ambil semua link di menu
    var menuLinks = document.querySelectorAll('nav a');
    
    // Loop melalui setiap link dan periksa apakah URL-nya cocok
    menuLinks.forEach(function(link) {
        if (link.getAttribute('href') === currentPath.split('/').pop()) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
