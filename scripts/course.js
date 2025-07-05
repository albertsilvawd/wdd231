// Course list functionality
document.addEventListener('DOMContentLoaded', function () {
    // Course array - modify the completed property based on your actual completed courses
    const courses = [
        {
            subject: 'CSE',
            number: 110,
            title: 'Introduction to Programming',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course will introduce students to programming concepts and logic.',
            technology: [
                'Python'
            ],
            completed: true // Change this based on your completion status
        },
        {
            subject: 'WDD',
            number: 130,
            title: 'Web Fundamentals',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course introduces students to the World Wide Web and to careers in web site design and development.',
            technology: [
                'HTML',
                'CSS'
            ],
            completed: true // Change this based on your completion status
        },
        {
            subject: 'CSE',
            number: 111,
            title: 'Programming with Functions',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others.',
            technology: [
                'Python'
            ],
            completed: true // Change this based on your completion status
        },
        {
            subject: 'CSE',
            number: 210,
            title: 'Programming with Classes',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course will introduce the notion of classes and objects.',
            technology: [
                'C#'
            ],
            completed: false // Change this based on your completion status
        },
        {
            subject: 'WDD',
            number: 131,
            title: 'Dynamic Web Fundamentals',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course builds on prior experience in Web Fundamentals and programming.',
            technology: [
                'HTML',
                'CSS',
                'JavaScript'
            ],
            completed: true // Change this based on your completion status
        },
        {
            subject: 'WDD',
            number: 231,
            title: 'Frontend Web Development I',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming.',
            technology: [
                'HTML',
                'CSS',
                'JavaScript'
            ],
            completed: false // Currently taking this course
        }
    ];

    // Get DOM elements
    const coursesGrid = document.getElementById('coursesGrid');
    const totalCreditsElement = document.getElementById('totalCredits');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Variable to store currently displayed courses
    let currentCourses = courses;

    // Function to create course card HTML
    function createCourseCard(course) {
        const completedClass = course.completed ? 'completed' : '';

        return `
            <div class="course-card ${completedClass}">
                <h3>${course.subject} ${course.number}</h3>
                <p>${course.title}</p>
                <p><strong>Credits:</strong> <span class="course-credits">${course.credits}</span></p>
                <p><strong>Certificate:</strong> ${course.certificate}</p>
                <p><strong>Description:</strong> ${course.description}</p>
                <p><strong>Technologies:</strong> ${course.technology.join(', ')}</p>
            </div>
        `;
    }

    // Function to display courses
    function displayCourses(coursesToDisplay) {
        if (coursesToDisplay.length === 0) {
            coursesGrid.innerHTML = '<p class="no-courses">No courses found for this filter.</p>';
            return;
        }

        const courseCardsHTML = coursesToDisplay.map(course => createCourseCard(course)).join('');
        coursesGrid.innerHTML = courseCardsHTML;
    }

    // Function to calculate and display total credits
    function updateTotalCredits(coursesToCalculate) {
        const totalCredits = coursesToCalculate.reduce((total, course) => total + course.credits, 0);
        totalCreditsElement.textContent = totalCredits;
    }

    // Function to filter courses
    function filterCourses(filter) {
        let filteredCourses;

        switch (filter) {
            case 'wdd':
                filteredCourses = courses.filter(course => course.subject === 'WDD');
                break;
            case 'cse':
                filteredCourses = courses.filter(course => course.subject === 'CSE');
                break;
            case 'all':
            default:
                filteredCourses = courses;
                break;
        }

        currentCourses = filteredCourses;
        displayCourses(filteredCourses);
        updateTotalCredits(filteredCourses);
    }

    // Function to update active filter button
    function updateActiveFilter(activeButton) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    // Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');
            filterCourses(filter);
            updateActiveFilter(this);
        });
    });

    // Initialize the page with all courses
    filterCourses('all');

    // Add some console logging for debugging
    console.log('Total courses loaded:', courses.length);
    console.log('Completed courses:', courses.filter(course => course.completed).length);
    console.log('Courses array:', courses);
});