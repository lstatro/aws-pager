export const pager = async <R>(
  promise: Promise<unknown>,
  attribute: string
) => {
  let resources: R[] = []
  let hasNextPage

  do {
    hasNextPage = false

    /**
     * - wait for the promise to finish
     * - it pains me to use an "any", but we save a lot of pain by doing so
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await promise) as any

    /** in the result did we find the target response key? */
    if (result[attribute]) {
      /** looks like we did, lets add it to our resource array and move on */
      resources = resources.concat(result[attribute])
    }

    /**
     * honestly AWS always returns a response, I'm checking this because
     * I don't want to go back and update every test.
     *
     * Call me lazy.  I'm good with that.  I'll trade one if check to save
     * possibly hundreds of mocks.  Sounds like a good deal to me.
     */

    /** was there an AWS response object returned with the request? */
    if (result.$response) {
      /** is there another page to the request? */
      hasNextPage = result.$response.hasNextPage()
      if (hasNextPage) {
        /**
         * reset the promise to the next page and iterate.
         * I am not entirely sure the sdk is setup to use .promise off the
         * nextPage function, but it works!  If result wasn't any we would
         * see an error indicating that .promise() is not a method off the
         * nextPage function.
         */
        promise = result.$response.nextPage().promise()
      }
    }
  } while (hasNextPage)

  return resources
}
