# js-request-batching
## Build & Run Instruction

From your command line tool run the steps below to build and run the project:
- **git clone https://github.com/oluwatobimaxwell/js-request-batching.git**
- cd js-request-batching
- npm install 
- npm start

The project should be served on http://localhost:1234

If you have another process running on port 1234, a port other than 1234 will be auto-assigned.

> 

## QUESTIONS & ANSWERS

## (a) How to test your code?

From your command line tool run the steps below to test:
- cd js-request-batching
- npm run test

The test result will show like this, please **note** that the cases are the default test cases from the assignments.

![enter image description here](https://ik.imagekit.io/cmu8v8879kr/Screenshot_2022-02-28_at_2.45.49_AM_mzAgUfa_H.png?ik-sdk-version=javascript-1.4.3&updatedAt=1646012941644)
## (b) What are the challenges you faced? and how did you solve them?
- There is limited information on the internet (google/stackoverflow) regarding this topic - *http request batching*. So I had to study up on the basics of axios requests interceptors, paid close attention to features such as **request.interceptor** and  **response.interceptor**, as well as understanding the problem requirements in detail for me arrive at a reasonable solution.


## (b) Give another good use case for batching requests and its benefits
Use case:

 - Imagine an email client. It might need the user’s name, their photo, possibly their email messages and maybe even information from their calendar and you can make things a lot more efficient by putting all those requests into a single HTTP request using batching.
-   We can also use batching for collecting dashboard widgets data.

Benefits:

 - Requests are sent at once, their by its time saving.
 - Reduced latency: Batched transactions can start immediately instead of waiting for other transactions to be completed.
 - Increased throughput: The storage system can perform parallel transactions and increase aggregate transaction throughput.


